defmodule BlockScoutWeb.PoolsController do
  use BlockScoutWeb, :controller

  alias Explorer.Counters.AverageBlockTime
  alias Explorer.Chain
  alias BlockScoutWeb.{PoolsView, StakesView}
  alias Explorer.Staking.EpochCounter
  alias Explorer.Chain.BlockNumberCache

  import BlockScoutWeb.Chain, only: [paging_options: 1, next_page_params: 3, split_list_by_page: 1]

  def validators(conn, params) do
    render_list(:validator, conn, params)
  end

  def active_pools(conn, params) do
    render_list(:active, conn, params)
  end

  def inactive_pools(conn, params) do
    render_list(:inactive, conn, params)
  end

  defp render_list(_, conn, %{"modal_window" => window_name, "pool_hash" => pool_hash} = params) do
    window =
      pool_hash
      |> Chain.staking_pool()
      |> render_modal(window_name, params)

    json(conn, %{window: window})
  end

  defp render_list(filter, conn, %{"type" => "JSON"} = params) do
    [paging_options: options] = paging_options(params)

    last_index =
      params
      |> Map.get("position", "0")
      |> String.to_integer()

    pools_plus_one =
      filter
      |> Chain.staking_pools(options)
      |> Enum.with_index(last_index + 1)
      |> Enum.map(fn {pool, index} ->
        Map.put(pool, :position, index)
      end)

    {pools, next_page} = split_list_by_page(pools_plus_one)

    next_page_path =
      case next_page_params(next_page, pools, params) do
        nil ->
          nil

        next_page_params ->
          next_page_path(filter, conn, Map.delete(next_page_params, "type"))
      end

    average_block_time = AverageBlockTime.average_block_time()

    items =
      pools
      |> Enum.map(fn pool ->
        Phoenix.View.render_to_string(
          PoolsView,
          "_rows.html",
          pool: pool,
          average_block_time: average_block_time,
          pools_type: filter
        )
      end)

    json(
      conn,
      %{
        items: items,
        next_page_path: next_page_path
      }
    )
  end

  defp render_list(filter, conn, _) do
    average_block_time = AverageBlockTime.average_block_time()
    epoch_number = EpochCounter.epoch_number()
    epoch_end_block = EpochCounter.epoch_end_block()
    block_number = BlockNumberCache.max_number()

    options = [
      average_block_time: average_block_time,
      pools_type: filter,
      epoch_number: epoch_number,
      epoch_end_in: epoch_end_block - block_number,
      block_number: block_number,
      current_path: current_path(conn)
    ]

    render(conn, "index.html", options)
  end

  defp next_page_path(:validator, conn, params) do
    validators_path(conn, :validators, params)
  end

  defp next_page_path(:active, conn, params) do
    active_pools_path(conn, :active_pools, params)
  end

  defp next_page_path(:inactive, conn, params) do
    inactive_pools_path(conn, :inactive_pools, params)
  end

  defp render_modal(pool, "info", _params) do
    Phoenix.View.render_to_string(
      StakesView,
      "_stakes_modal_validator_info.html",
      validator: pool
    )
  end

  defp render_modal(pool, "make_stake", _params) do
    Phoenix.View.render_to_string(
      StakesView,
      "_stakes_modal_stake.html",
      pool: pool
    )
  end

  defp render_modal(pool, "withdraw", _params) do
    Phoenix.View.render_to_string(
      StakesView,
      "_stakes_modal_withdraw.html",
      pool: pool
    )
  end

  defp render_modal(%{staking_address_hash: address} = pool, "move_stake", _params) do
    pools =
      :active
      |> Chain.staking_pools()
      |> Enum.filter(&(&1.staking_address_hash != address))
      |> Enum.map(fn %{staking_address_hash: hash} ->
        string_hash = to_string(hash)
        [
          key: binary_part(string_hash, 0, 13),
          value: string_hash
        ]
      end)

    Phoenix.View.render_to_string(
      StakesView,
      "_stakes_modal_move.html",
      pool: pool,
      pools: pools
    )
  end

  defp render_modal(%{staking_address_hash: address} = pool, "move_selected", params) do
    pools =
      :active
      |> Chain.staking_pools()
      |> Enum.filter(&(&1.staking_address_hash != address))
      |> Enum.map(fn %{staking_address_hash: hash} ->
        string_hash = to_string(hash)
        [
          key: binary_part(string_hash, 0, 13),
          value: string_hash
        ]
      end)

    pool_to =
      params
      |> Map.get("pool_to")
      |> Chain.staking_pool()

    Phoenix.View.render_to_string(
      StakesView,
      "_stakes_modal_move_selected.html",
      pool_from: pool,
      pool_to: pool_to,
      pools: pools
    )
  end
end
